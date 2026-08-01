import {Request, Response} from 'express';
import {getStatistics} from '../services/report.service';

export async function getStatisticsController(req: Request, res: Response): Promise<void> {
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!;
        const brokerId = role === "SUB_BROKER" && brokerIdToken ? brokerIdToken : userId;
        const statistics = await getStatistics(brokerId);
        res.status(200).json(statistics);

    }catch(error){
        if(error instanceof Error){
            res.status(400).json({error: error.message});
            return;
        }
        res.status(500).json({message: "Error interno del servidor"});
    }

}
