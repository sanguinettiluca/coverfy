export type TwoFactorSetupResponse = {
    qrCode: string;
    secret: string;
};

export type TwoFactorConfirmResponse = {
    backupCodes: string[];
};