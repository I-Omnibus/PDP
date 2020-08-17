

function moveSwitch(id, top) {
    document.getElementById(id).style.borderTopWidth = top;
    document.getElementById(id).style.borderBottomWidth = 44 - top;
}

function setSwitch(id, value) {
    CPU.switchRegister ^= value;
    if (CPU.switchRegister & value) {
        moveSwitch(id, 8);
    } else {
        moveSwitch(id, 22);
    }
}

function examineDeposit(data) {
    var result, autoMask, trapState;
    if (data < 0) {
        autoMask = 1; // Examine auto increment mask
    } else {
        autoMask = 2; // Deposit auto increment mask
    }
    if (panel.rotary0 > 1) { // If a virtual address is selected...
        CPU.displayAddress &= 0xffff;
    } else {
        if (CPU.cpuType !== 70 && CPU.displayAddress >= IOBASE_18BIT) CPU.displayAddress |= IOBASE_22BIT;
    }
    if (panel.autoIncr & autoMask) {
        if (CPU.displayAddress >= 017777700 && CPU.displayAddress <= 017777717) {
            CPU.displayAddress++; // register addresses increment by 1
            if (CPU.displayAddress >= 017777720) CPU.displayAddress = 017777700; // register loop
        } else {
            CPU.displayAddress += 2;
        }
    }
    trapState = CPU.trapPSW;
    CPU.trapPSW = -2; // Disable trap handling
    if (panel.rotary0 > 1) { // If a virtual address is selected...
        CPU.displayAddress &= 0xffff;
        CPU.mmuMode = panel.rotary0 >> 1;
        if (CPU.mmuMode < 3) CPU.mmuMode--;
        if (data < 0) {
            result = readWordByVirtual(CPU.displayAddress | (((~panel.rotary0) & 1) << 16));
        } else {
            result = writeWordByVirtual(CPU.displayAddress | (((~panel.rotary0) & 1) << 16), data & 0xffff);
            if (result >= 0) {
                result = data & 0xffff; // Write return may just be a status
            }
        }
        if (result >= 0) {
            CPU.mmuMode = (CPU.PSW >> 12) & 3; // Put back proper mode.
        }
    } else { // Physical address then
        CPU.displayAddress &= 0x3fffff;
        if (CPU.displayAddress < IOBASE_UNIBUS && ((CPU.displayAddress & 1) || CPU.displayAddress >= MAX_MEMORY)) {
            result = -1; // Odd address / out of bounds check for unvalidated memory address
            CPU.statusLights |= 0x400; // Set ADRS ERR light
        } else {
            CPU.statusLights &= ~0x400; // Clear ADRS ERR light (may be set again by fallowing calls)
            if (data < 0) {
                result = readWordByPhysical(CPU.displayAddress); // examine -> read
            } else {
                result = writeWordByPhysical(CPU.displayAddress, data & 0xffff); // deposit -> write
                if (result >= 0) {
                    result = data & 0xffff; // Write return may just be a status
                } else {
                    if (CPU.displayAddress == 017777776) {
                        result = readPSW(); // PSW write signals false error (to stop CPU flag updates)
                    }
                }
            }
        }
    }
    CPU.trapPSW = trapState; // Reenable trap handling
    if (result >= 0) {
        panel.autoIncr = autoMask; // Set auto increment for next time
        CPU.displayDataPaths = result;
    } else {
        panel.autoIncr = 0;
    }
    CPU.displayAddress &= (CPU.cpuType == 70 ? 0x3fffff : 0x3ffff);
}
document.getElementById('0').focus();
///////////////boot();