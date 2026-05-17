export interface TokenizedLine {
    label: string | null;
    mnemonic: string | null;
    operand: string | null;
    lineNumber: number;
}

interface InstructionDetail {
    opcode: number;
    size: number;
    expectsOperand: boolean;
    isRegisterOp?: boolean;  
}

 
const InstructionSet: Record<string, InstructionDetail> = {
    "ADD": { opcode: 0x01, size: 1, expectsOperand: false },
    "SUB": { opcode: 0x02, size: 1, expectsOperand: false },
    "PUSH": { opcode: 0x03, size: 2, expectsOperand: true },    
    "JMP": { opcode: 0x04, size: 3, expectsOperand: true },     
    "JZ": { opcode: 0x05, size: 3, expectsOperand: true },      
    "EQ": { opcode: 0x06, size: 1, expectsOperand: false },
    "MOV_LIT_REG": { opcode: 0x07, size: 4, expectsOperand: true, isRegisterOp: true },  
    "MOV_REG_REG": { opcode: 0x08, size: 3, expectsOperand: true, isRegisterOp: true },  
    "PUSH_REG": { opcode: 0x09, size: 2, expectsOperand: true, isRegisterOp: true },     
    "HALT": { opcode: 0xFF, size: 1, expectsOperand: false },
};

export class Assembler {
    
    public tokenize(sourceCode: string): TokenizedLine[] {
        const lines = sourceCode.split('\n');
        const parsedCode: TokenizedLine[] = [];
        for (let i = 0; i < lines.length; i++) {
            let cleanLine = lines[i].split(';')[0].trim();
            if (cleanLine === '') continue;
            let label: string | null = null;
            let mnemonic: string | null = null;
            let operand: string | null = null;

            if (cleanLine.includes(':')) {
                const parts = cleanLine.split(':');
                label = parts[0].trim();
                cleanLine = parts[1].trim();
            }

            if (cleanLine.length > 0) {
                const parts = cleanLine.split(/\s+/);
                mnemonic = parts[0].toUpperCase();
                if (parts.length > 1) {
                    operand = parts.slice(1).join(' ');  
                }
            }

            parsedCode.push({ label, mnemonic, operand, lineNumber: i + 1 });
        }
        return parsedCode;
    }

     
    private buildSymbolTable(tokens: TokenizedLine[], startAddress: number): Record<string, number> {
        const symbolTable: Record<string, number> = {};
        let locationCounter = startAddress;

        for (const token of tokens) {
            if (token.label) {
                symbolTable[token.label] = locationCounter;
            }
            if (token.mnemonic) {
                const meta = InstructionSet[token.mnemonic];
                if (meta) locationCounter += meta.size;
            }
        }
        return symbolTable;
    }

    private getRegisterIndex(regName: string): number {
        const match = regName.match(/R([0-7])/i);
        if (!match) throw new Error(`Invalid register: ${regName}`);
        return parseInt(match[1]);
    }

    
    public generateBytecode(tokens: TokenizedLine[], symbolTable: Record<string, number>): number[] {
        const byteData: number[] = [];

        for (const token of tokens) {
            if (!token.mnemonic) continue;

            const meta = InstructionSet[token.mnemonic];
            if (!meta) throw new Error(`Line ${token.lineNumber}: Unknown instruction ${token.mnemonic}`);

            byteData.push(meta.opcode);

            if (meta.expectsOperand && token.operand) {
                const ops = token.operand.split(/[\s,]+/).map(s => s.trim());

                
                if (token.mnemonic === "MOV_LIT_REG") {
                    byteData.push(this.getRegisterIndex(ops[0]));
                    const val = parseInt(ops[1]);
                    byteData.push((val >> 8) & 0xFF);  
                    byteData.push(val & 0xFF);       
                } 
                else if (token.mnemonic === "MOV_REG_REG") {
                    byteData.push(this.getRegisterIndex(ops[0]));
                    byteData.push(this.getRegisterIndex(ops[1]));
                }
                else if (token.mnemonic === "PUSH_REG") {
                    byteData.push(this.getRegisterIndex(ops[0]));
                }
               
                else {
                    let val = symbolTable[token.operand] ?? parseInt(token.operand);
                    if (meta.size === 3) {  
                        byteData.push((val >> 8) & 0xFF);
                        byteData.push(val & 0xFF);
                    } else {  
                        byteData.push(val & 0xFF);
                    }
                }
            }
        }
        return byteData;
    }
    
 
    public assemble(sourceCode: string, startAddress: number = 0x3000): Uint8Array {
        const tokens = this.tokenize(sourceCode);
        const symbolTable = this.buildSymbolTable(tokens, startAddress);
        const rawBytes = this.generateBytecode(tokens, symbolTable);

        if (startAddress + rawBytes.length > 65536) {
            throw new Error("Program too large for VM memory.");
        }
        return new Uint8Array(rawBytes);
    }
}