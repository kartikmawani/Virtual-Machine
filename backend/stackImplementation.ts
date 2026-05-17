const  Opcode={
    ADD:0x01,
    SUB:0x02,
    PUSH:0x03,
    JMP:0x04,
    JZ:0x05,
    EQ:0x06,
    HALT:0xFF    
}as const;


 export interface  VMState{
      pc:number,
      registers:number[],
      memory:Uint8Array,
      stack:number[],

}

class VirtualMachine{
    private pc:number=0;
    private memory:Uint8Array;
    private registers:Uint16Array;
    private stack:number[]=[];
    private running:boolean=false;
     
    constructor(memorySize: number = 65536) {
        this.memory = new Uint8Array(memorySize);
        this.registers = new Uint16Array(8);
    }

    public loadProgram(bytecode: Uint8Array, startAddress: number = 0x3000): void {
        this.pc = startAddress; 
        this.memory.set(bytecode, startAddress);
    }
    public run():void{
        this.running=true;
        while(this.running){
            this.step();
        }
    }
    private fetch16(): number {
        const highByte = this.memory[this.pc++];
        const lowByte = this.memory[this.pc++];
        return (highByte << 8) | lowByte;
    }
    private fetch8(): number {
        return this.memory[this.pc++];
    }
    public getGameState():VMState{
       return{
        pc:this.pc,
        memory:this.memory,
        stack:[...this.stack],
       
         registers:Array.from(this.registers)
       }        
    }
    public step(){
        const instruction=this.memory[this.pc];
        this.pc++;
        switch(instruction){
            case Opcode.ADD:
                 this.executeAdd();
                 break;
            case Opcode.SUB:
                 this.executeSub();
                 break;
            case Opcode.HALT:
                 this.running=false;
                 console.log("VM halted");
                 break;
            case Opcode.PUSH:
                 this.executePush();
                 break;
            case Opcode.JMP:
                 this.executeJump();
                 break;
            case Opcode.JZ:
                 this.executeJumpZero();
                 break;
            case Opcode.EQ:
                 this.executeEquals();
                 break;
            case 0x07: {  
               const regIndex = this.fetch8();   
               const literal = this.fetch16();    
               if (regIndex >= this.registers.length) {
                     throw new Error(`Invalid register index: R${regIndex}`);
                 } 
                 this.registers[regIndex] = literal;
                   break;
               }  

       case 0x08: {  
           const srcReg = this.fetch8();
           const destReg = this.fetch8();
           this.registers[destReg] = this.registers[srcReg];
           break;
          }
        case 0x09: {  
            const regIndex = this.fetch8();
            this.stack.push(this.registers[regIndex]);
            break;
           }
        }
    }
    public executeAdd():void{
        if (this.stack.length < 2) 
            {
                throw new Error("Stack Underflow at ADD");
            }           
                const b=this.stack.pop()!;
           const a=this.stack.pop()!;
           this.stack.push(a+b);
    }
     public executeSub():void{
            if (this.stack.length < 2) 
                throw new Error("Stack Underflow at SUB");
        const b = this.stack.pop()!;
        const a = this.stack.pop()!;
        this.stack.push(a - b);
    }
    private executePush(): void {
        const value = this.memory[this.pc++]; 
        this.stack.push(value);
    }
    public executeJump():void{
        this.pc = this.fetch16();
      }
    public executeJumpZero():void{
         const targetAddress = this.fetch16();
        if (this.stack.length === 0) 
            throw new Error("Stack Underflow at JZ");
        const value = this.stack.pop()!;
        if (value === 0) {
            this.pc = targetAddress;
        }
    }
    public executeEquals():void{
            if (this.stack.length < 2) 
            {
                throw new Error("Stack Underflow at ADD");
            } 
          const a=this.stack.pop()!;
          const b=this.stack.pop()!;
          if(a==b){
            this.stack.push(1);
          }
          else{
            this.stack.push(0);
          }
    }
    }
     
    
const vm=new VirtualMachine();

const program=new Uint8Array([
    0x03, 3,        
    0x03, 1,        
    0x02,           
    0x05, 0, 11,   
    0x04, 0, 2,   
    0xFF,
])
vm.loadProgram(program,0);
vm.run();