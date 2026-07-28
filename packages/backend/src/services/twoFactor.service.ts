import {generateSecret, generateURI, verify} from 'otplib';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const APP_NAME = 'Coverfy'
const BACKUP_CODES_COUNT = 8
const TOLERANCE_SECONDS = 30


export async function generateTotpSecret(email: string): Promise<{secret: string, otpauthUrl: string}> {
    const secret = generateSecret();
    const otpauthUrl = generateURI( {issuer: APP_NAME, label: email, secret} );
    return { secret, otpauthUrl };
}

export async function generateQRCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
}

export async function verifyCode(secret: string, code: string): Promise<boolean> {
    try{
        const result = await verify({secret, token: code, epochTolerance: TOLERANCE_SECONDS});
        return result.valid;
    }catch{
        return false;
    }
}

export async function generateBackupCodes(): Promise<{ codesToDisplay: string[]; hashedCodes: string[] }> {
    const codesToDisplay: string[] = [];
    for(let i=0; i < BACKUP_CODES_COUNT; i++){
        codesToDisplay.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    const hashedCodes = await Promise.all(
        codesToDisplay.map( (code) => bcrypt.hash(code, 10) )
    )

    return { codesToDisplay, hashedCodes };
}

export async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<number> {
    for(let i=0; i < hashedCodes.length; i++){
        const matches = await bcrypt.compare(code, hashedCodes[i]);
        if(matches){
            return i;
        }
    }
    return -1;
}
