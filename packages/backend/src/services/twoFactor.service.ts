import {generateSecret, generateURI, verify} from 'otplib';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const NOMBRE_APP = 'Coverfy'
const CANTIDAD_BACKUP_CODES = 8
const TOLERANCIA_SEGUNDOS = 30


export async function generarSecret(email: string): Promise<{secret: string, otpauthUrl: string}> {
    const secret = generateSecret();
    const otpauthUrl = generateURI( {issuer: NOMBRE_APP, label: email, secret} );
    return { secret, otpauthUrl };
}

export async function generarQRCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
}

export async function verificarCodigo(secret: string, codigo: string): Promise<boolean> {
    try{
        const resultado = await verify({secret, token: codigo, epochTolerance: TOLERANCIA_SEGUNDOS});
        return resultado.valid;
    }catch{
        return false;
    }
}

export async function generarBackupCodes(): Promise<{ codigosParaMostrar: string[]; codigosHasheados: string[] }> {
    const codigosParaMostrar: string[] = [];
    for(let i=0; i < CANTIDAD_BACKUP_CODES; i++){
        codigosParaMostrar.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    const codigosHasheados = await Promise.all(
        codigosParaMostrar.map( (codigo) => bcrypt.hash(codigo, 10) )
    )

    return { codigosParaMostrar, codigosHasheados };
}

export async function verificarBackupCode(codigo: string, codigosHasheados: string[]): Promise<number> {
    for(let i=0; i < codigosHasheados.length; i++){
        const coincide = await bcrypt.compare(codigo, codigosHasheados[i]);
        if(coincide){
            return i;
        }
    }
    return -1;
}