using Microsoft.JSInterop;
using SupportLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PDP11 {
    public partial class BootstrapLoader {
        [Microsoft.AspNetCore.Components.Inject]
        IJSRuntime JSRuntime { get; set; }

        protected override async void OnAfterRender( bool firstRender ) {
            await Bootstrap();
        }

        private async Task Bootstrap() {
            await JSRuntime.InvokeVoidAsync( "Bootstrap" );
        }

        [JSInvokable]
        public static Task<UInt16[]> GetBootRom() {
            var result = new BootRom().Content;
            return Task.FromResult( result );
        }
    }
}
