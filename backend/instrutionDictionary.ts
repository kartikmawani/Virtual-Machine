interface InstructionDetail {
    opcode: number;
    size: number;
    expectsOperand: boolean;
}
 
const InstructionSet: Record<string, InstructionDetail> = {
    "ADD":  { opcode: 0x01, size: 1, expectsOperand: false },
    "SUB":  { opcode: 0x02, size: 1, expectsOperand: false },
    "PUSH": { opcode: 0x03, size: 2, expectsOperand: true  },
    "JMP":  { opcode: 0x04, size: 2, expectsOperand: true  },
    "JZ":   { opcode: 0x05, size: 2, expectsOperand: true  },
    "EQ":   { opcode: 0x06, size: 1, expectsOperand: false },
    "HALT": { opcode: 0xFF, size: 1, expectsOperand: false },
};