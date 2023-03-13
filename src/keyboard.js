// const electron = require('electron');
// const globalShortcut = electron.remote.globalShortcut;

//TODO: Implement script to read button id's and assign specific buttons to a keyboard input.

//Possible routes: BrowserWindow, GlobalShortcut, (???)

/*
var register = document.getElementById("kbtn-w-down"); //todo: Should be const.
var unregister = document.getElementById("kbtn-w-up");
 
register.addEventListener("click", (event) => {
    const check = globalShortcut.register("CommandOrControl+Shift+X", () => {
        console.log("CommandOrControl+Shift+X is pressed");
    });
 
    if (check) {
        console.log("Ctrl+Shit+X Registered Successfully");
    }
 
    globalShortcut.registerAll(["CommandOrControl+X",
                                "CommandOrControl+Y"], () => {
        console.log("One Global Shortcut defined " +
                    "in registerAll() method is Pressed.");
    });
});
 
unregister.addEventListener("click", (event) => {
    if (globalShortcut.isRegistered("CommandOrControl+Shift+X")) {
        globalShortcut.unregister("CommandOrControl+Shift+X");
        console.log("Ctrl+Shit+X unregistered Successfully");
    }
 
    globalShortcut.unregisterAll();
});

 */