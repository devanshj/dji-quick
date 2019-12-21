import React from "react";
import Invoice from "../Invoice";
import InvoiceModel from "../../models/Invoice";
import "./index.scss"
import { observer, useAsObservableSource } from "mobx-react-lite";

export const ThemeContext = React.createContext({
    isDarkMode: false
})

const App = () => {
    let invoice = useAsObservableSource(new InvoiceModel({
        "number": 1,
        "date": (() => {
			let d = new Date();
			d.setHours(0,0,0,0);
			return d;
		})(),
        "billedTo": {
            "name": "",
            "address": ""
        },
        "items": [{
            "desc": "",
            "qty": 0,
            "rate": 0
        }]
    }))

    let darkTheme = useAsObservableSource({
        isDarkMode: JSON.parse(localStorage.getItem("dj-invoice-is-dark-theme") || "false")
    })


    return <ThemeContext.Provider value={darkTheme}>
        <Invoice invoice={invoice}/>
    </ThemeContext.Provider>
}
export default observer(App);