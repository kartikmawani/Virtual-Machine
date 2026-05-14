const symbolTable:Record<string,number>={};

const locationAddress=0x3000;

for(let i=0;i<parseCode.length;i++){
    const line=parseCode[i];
    if(line.label){
         symbolTable[line.label]=locationAddress
    }
    if(line.mnemonic){
        const byteSize=InstructionSet[line.mnemonic].size;
        const locationAddress+=byteSize;
    }
}