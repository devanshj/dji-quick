import { observable, computed } from "mobx";
import InvoiceItem, { IInvoiceItemConstructorProps } from "./InvoiceItem";
import { numberToWords, readableDate } from "../utils";

export interface IInvoiceJson {
	number: number,
	date: string,
	billedTo: {
		name: string,
		address: string
	},
	items: IInvoiceItemConstructorProps[]
}

export interface IInvoiceConstructorProps {
	number: number,
	date: Date,
	billedTo: {
		name: string,
		address: string
	},
	items: Array<InvoiceItem | IInvoiceItemConstructorProps>
}

export default class Invoice {
	@observable number: number;
	@observable date: Date;
	@observable billedTo = {
		name: "",
		address: ""
	};
	@observable items: InvoiceItem[] = [];
	@computed get total() {
		return this.items.reduce(
			(total, item) => total + item.cost, 0
		)
	}

	@computed get year() {
		if (!this.date) return "";

		let marchEndOfSameYear = (() => {
			let d = new Date(this.date);
			d.setDate(31);
			d.setMonth(2);
			return d;
		})();

		return (
			this.date.valueOf() < marchEndOfSameYear.valueOf() ? [
				this.date.getFullYear() - 1, "-",
				this.date.getFullYear().toString().substr(-2, 2)
			].join("") : [
				this.date.getFullYear(), "-",
				(this.date.getFullYear() + 1).toString().substr(-2, 2)
			].join("")
		);
	}

	constructor({ number, date, billedTo, items}: IInvoiceConstructorProps) {
		this.number = number;
		this.date = date;
		this.billedTo = billedTo;
		this.items = items.map(
			item => 
				!(item instanceof InvoiceItem) ?
					new InvoiceItem(item)
				: item
		);
	}

	static fromJson(invoiceJson: IInvoiceJson) {
		return new Invoice({
			...invoiceJson,
			date: new Date(invoiceJson.date)
		});
	}

	toJson() {
		let {number, date, billedTo, items} = this;
		return {number, date, billedTo, items};
	}

	deleteItem(item: InvoiceItem) {
		this.items.splice(
			this.items.indexOf(item), 1
		);
	}

	insertItemAfter(item: InvoiceItem) {
		this.items.splice(
			this.items.indexOf(item) + 1, 0,
			new InvoiceItem()
		)
	}

	insertItemBefore(item: InvoiceItem) {
		this.items.splice(
			this.items.indexOf(item), 0,
			new InvoiceItem()
		)
	}

	toBlobUrl() {
		let { number, date, year, billedTo, items, total } = this;
		let xml =
`<?xml version="1.0" encoding="UTF-8"?>
<invoice number="${number.toString().padStart(3, "0")}/${year}" date="${readableDate(date)}">
	<from>
		<name>${process.env.REACT_APP_FROM_NAME}</name>
		<address>${process.env.REACT_APP_FROM_ADDRESS}</address>
		<contact>${process.env.REACT_APP_FROM_CONTACT}</contact>
	</from>
	<to>
		<name>${billedTo.name}</name>
		<address>${billedTo.address.replace(/\n/g, "&#A;")}</address>
	</to>
	<items>
		${items.map(({desc, qty, rate, cost}) => 
		`<item>
			<desc>${desc}</desc>
			<qty>${qty.toLocaleString("en-IN")}</qty>
			<rate>${rate.toLocaleString("en-IN")}</rate>
			<cost>${cost.toLocaleString("en-IN")}</cost>
		</item>`
		).join("\n\t\t")}
	</items>
	<total words="${numberToWords(total)}">${total.toLocaleString("en-IN")}</total>
</invoice>`;

		return URL.createObjectURL(new Blob([xml], { type: "text/xml"}));
	}
}