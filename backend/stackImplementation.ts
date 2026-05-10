enum Opcode{
    ADD=0x01,
    SUB=0x02,
    PUSH=0x03,
    HALT=0xff  
}

class VirtualMachine{
    private pc:number=0;
    private memory:Uint8Array;
    private stack:number[]=[];
    private running:boolean=false;

    constructor(memorySize: number = 65536) {
        this.memory = new Uint8Array(memorySize);
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
    public step(){
        const instruction=this.memory[this.pc];
        this.pc++;
        switch(instruction){
            case Opcode.ADD:
                 this.executeAdd();
                 break;
            case Opcode.SUB:
                 this.exectueSub();
                 break;
            case Opcode.HALT:
                 this.running=false;
                 console.log("VM halted");
                 break;
            case Opcode.PUSH:
                 this.executePush();
                 break;
        }
    }
    public executeAdd():void{
           const b=this.stack.pop()!;
           const a=this.stack.pop()!;
           this.stack.push(a+b);
    }
     public exectueSub():void{
           const b=this.stack.pop()!;
           const a=this.stack.pop()!;
           this.stack.push(a-b);
    }
    private executePush(): void {
        const value = this.memory[this.pc++]; 
        this.stack.push(value);
    }
}