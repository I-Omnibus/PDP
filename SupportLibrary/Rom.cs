using System;
using System.Collections.Generic;
using System.Text;

namespace SupportLibrary {
    public abstract class Rom {
        public virtual UInt32 baseAddress { get; }

        public virtual UInt16[] Content { get; }
    }
}
