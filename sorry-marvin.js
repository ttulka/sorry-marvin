const interpret = (program, memory, maxSteps, onStep) => {    
    // initialize
    const p = parse(program)         // program
    const m = Array.isArray(memory)  // memory (registers)
                ? [memory[0] ? memory[0]-0 : 0, memory[1] ? memory[1]-0 : 0, memory[2] ? memory[2]-0 : 0, memory[3] ? memory[3]-0 : 0] 
                : [0, 0, 0, 0]
    const ms = maxSteps > 0 ? maxSteps : 0

    let pc = 0   // program counter
    let rc = 0   // register counter
    
    // execute
    let sc = 0   // step counter
    while (pc < p.length && (!ms || ++sc <= ms)) {
        const i = p[pc]

        switch (i.id) {
            case 'MVINC':
                rc = (rc + 1) % m.length
                rc = rc >= 0 ? rc : m.length + rc
                m[rc]++
                pc++
                break
            case 'DECJZDEC':
                if (m[rc] > 0) m[rc]--
                if (i.attr > 1) {
                    if (m[rc] === 0) {
                        pc = (pc + i.attr) % p.length
                        pc = pc >= 0 ? pc : p.length + pc
                    } else {                    
                        if (m[rc] > 0) m[rc]--
                        pc++
                    }
                } else {
                    pc++
                }
                break
        }
        
        if (typeof onStep === 'function') onStep([...m])
    }

    if (maxSteps && sc > maxSteps && !onStep) throw new Error('Maximal steps exceeded')

    return [...m]
}

// parse the program to AST
function parse(program) {
    if (!new RegExp('^[!>]*$').test(program)) throw new Error('Syntax error: invalid code')

    return (program.match(/(!|>+)/g) || [])
        .map(instr => {
            switch (instr[0]) {
                case '!': return new Instr('MVINC')
                case '>': return new Instr('DECJZDEC', instr.length)
                default: throw new Error('Syntax error: invalid instruction ' + instr)
            }
        })
}

class Instr {
    constructor(id, attr) {
        this.id = id
        this.attr = attr
    }
}

module.exports = interpret