import { Navigator } from "./nav";

function clicked(button, implemented) {
    alert("Interface Script Loaded: Clicked "+ button+ " button ("+ implemented+ ")");
    let NavControl = new Navigator();
    NavControl.navigation();
}