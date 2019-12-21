import React, { ChangeEvent, useState, useEffect, useContext } from "react";
import { observer, useAsObservableSource } from "mobx-react-lite";

import InvoiceModel from "../../models/Invoice";
import { readableDate } from "../../utils";

import { FormGroup, InputGroup, TextArea, Position, ControlGroup, Tag, H3, Button, Intent, Classes, NumericInput } from "@blueprintjs/core";
import { DateInput } from "@blueprintjs/datetime";
import InvoiceItems from "../InvoiceItems";

import "./index.scss";
import { ThemeContext } from "../App";





export interface IInvoiceProps {
	invoice: InvoiceModel
};
export const InvoiceContext = React.createContext<InvoiceModel | null>(null);






const Invoice = (props : IInvoiceProps) => {
	let invoice = useAsObservableSource(props.invoice);
	let invoiceNumberReadable = invoice.number.toString().padStart(3, "0");
	let [isDownloading, setIsDownloading] = useState(false);
	let theme = useContext(ThemeContext);

	const handleDownload = () => {
		setIsDownloading(true);
		let a = document.createElement("a");
		a.href = invoice.toBlobUrl();
		a.download = "invoice-" + invoiceNumberReadable + ".xml";
		a.click();
		setIsDownloading(false);
	}

	useEffect(() => {
		if (theme.isDarkMode) {
			document.body.classList.add(Classes.DARK);
		} else {
			document.body.classList.remove(Classes.DARK);
		}

	}, [theme.isDarkMode])

	const handleThemeToggle = () => {
		theme.isDarkMode = !theme.isDarkMode;
		localStorage.setItem("dj-invoice-is-dark-theme", theme.isDarkMode ? "true" : "false");
	}

	return <>
		<div className="top-bar">
			<H3 className="invoice-title">Invoice {invoiceNumberReadable} / {invoice.year}</H3>
			<div>
				<Button onClick={handleThemeToggle} active={theme.isDarkMode} icon="moon" style={{marginRight: 10}}/>
				<Button onClick={handleDownload} loading={isDownloading} intent={Intent.PRIMARY} icon="cloud-download">Download XML</Button>
			</div>
		</div>
		<div className="invoice">
			<div className="left">
				<FormGroup label="Number">
					<NumericInput
						value={invoice.number}
						onValueChange={number => invoice.number = number}
						rightElement={
							invoice.year ? <Tag minimal={true}>
								{invoice.year}
							</Tag> : undefined
						}
						min={1}
						fill={true}/>
				</FormGroup>
				<FormGroup label="Date">
					<DateInput
						value={invoice.date}
						formatDate={readableDate}
						parseDate={str => new Date(str)}
						popoverProps={{
							position: Position.BOTTOM_LEFT,
							minimal: true,
							wrapperTagName: "div",
							targetTagName: "div"
						}}
						onChange={date => invoice.date = date}
						/>
				</FormGroup>
				<FormGroup label="Billed to">
					<ControlGroup fill={true} vertical={true}>
						<InputGroup
							value={invoice.billedTo.name}
							onChange={(event: ChangeEvent<HTMLInputElement>) => invoice.billedTo.name = event.target.value}
							placeholder="Name"/>
						<TextArea
							value={invoice.billedTo.address}
							onChange={event => invoice.billedTo.address = event.target.value}
							placeholder="Address"
							style={{resize: "vertical"}}
							rows={4}/>
					</ControlGroup>
				</FormGroup>
			</div>
			<div className="right">
				<InvoiceContext.Provider value={invoice}>
					<InvoiceItems/>
				</InvoiceContext.Provider>
			</div>
		</div>
	</>;
}
export default observer(Invoice);