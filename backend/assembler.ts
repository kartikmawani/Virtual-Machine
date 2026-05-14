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