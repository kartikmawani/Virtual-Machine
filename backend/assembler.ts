import { isNumberObject } from "node:util/types";

export interface TokenizedLine {
    label: string | null;       
    mnemonic: string | null;    
    operand: string | null;    
    lineNumber: number;     
}

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
                    operand = parts[1];  
                }
            }

           
            parsedCode.push({
                label: label,
                mnemonic: mnemonic,
                operand: operand,
                lineNumber: i + 1
            });
        }

        return parsedCode;
    }
     public generateBytecode(tokens: TokenizedLine[], symbolTable: Record<string, number>): Uint8Array {
    const byteData: number[] = [];
    for (const token of tokens) {
        if (token.mnemonic) {
            const instrReq = InstructionSet[token.mnemonic];
            if (!instrReq) {
                throw new Error(`Unknown instruction: ${token.mnemonic}`);
            }
 
            byteData.push(instrReq.opcode);
            if (instrReq.expectsOperand) {
                if (!token.operand) {
                    throw new Error(`${token.mnemonic} requires an operand!`);
                }
                if (symbolTable[token.operand] !== undefined) {
                    byteData.push(symbolTable[token.operand]);
                } else {
                    const value = parseInt(token.operand);
                    if (isNaN(value)) {
                        throw new Error(`Invalid operand: ${token.operand}`);
                    }
                    byteData.push(value);
                }
            }
        }
    }
    return new Uint8Array(byteData);
    
}
}

const asm = new Assembler();
const testProgram = `
    ; A simple loop program
    PUSH 3       ; Initialize counter
    
START:           ; This is a label
    SUB 1
    JZ END
    JMP START    ; Jump back up
    
END:
    HALT
`;

const tokens = asm.tokenize(testProgram);           
console.log(tokens);


if (startAddress + rawBytes.length > 65536) {
        throw new Error("Program too large: Exceeds VM memory boundaries.");
    }

    
    for (let i = 0; i < rawBytes.length; i++) {
        if (rawBytes[i] < 0 || rawBytes[i] > 255) {
            throw new Error(
                `Byte Overflow at index ${i}: Value ${rawBytes[i]} does not fit in 8 bits. 
                (Common cause: Label address is too high for a 1-byte operand)`
            );
        }
    }

    
    const binary = new Uint8Array(rawBytes);

    console.log("Assembly successful.");
    console.log(`Program size: ${binary.length} bytes.`);
    
    return binary;