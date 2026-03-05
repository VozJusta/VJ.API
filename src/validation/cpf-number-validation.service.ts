import { Injectable } from "@nestjs/common";

@Injectable()
export class CpfNumberValidation {

    private isValidCpf(cpf: string): boolean {
        if (!cpf) {
            return false;
        }

        const digitsOnly = cpf.replace(/\D/g, "");

        if (digitsOnly.length !== 11) {
            return false;
        }

        if (/^(\d)\1{10}$/.test(digitsOnly)) {
            return false;
        }

        const calculateCheckDigit = (base: string, factorStart: number): number => {
            let sum = 0;
            let factor = factorStart;

            for (let i = 0; i < base.length; i++, factor--) {
                sum += parseInt(base.charAt(i), 10) * factor;
            }

            const remainder = sum % 11;
            return remainder < 2 ? 0 : 11 - remainder;
        };

        const firstNineDigits = digitsOnly.substring(0, 9);
        const firstCheckDigit = calculateCheckDigit(firstNineDigits, 10);

        const firstTenDigits = firstNineDigits + String(firstCheckDigit);
        const secondCheckDigit = calculateCheckDigit(firstTenDigits, 11);

        const expectedCpf = firstTenDigits + String(secondCheckDigit);

        return digitsOnly === expectedCpf;
    }

    async validate(cpf: string) {
        return this.isValidCpf(cpf);
    }
}