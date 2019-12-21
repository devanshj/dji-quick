import React, { useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { InvoiceContext } from "../Invoice";

import { FormGroup, H4 } from "@blueprintjs/core";
import InvoiceItem from "../InvoiceItem";

import "./index.scss";

const InvoiceItems = () => {
	const invoice = useContext(InvoiceContext)!;
	const [isAnyDragging, isAnyDraggingSet] = useState(false);

	return <FormGroup label="Items" className="invoice-items-container">
		<table className={"invoice-items" + (isAnyDragging ? " is-any-dragging" : "")}>
			<thead>
				<tr>
					<th>Desciption</th>
					<th>Qty</th>
					<th>Rate</th>
					<th>Cost</th>
				</tr>
			</thead>
			<tbody>{
				invoice.items.length > 0 ?
					invoice.items.map(item => 
						<InvoiceItem item={item}
						key={item.id}
						onDragStart={() => isAnyDraggingSet(true)}
						onDragEnd={() => isAnyDraggingSet(false)}/>
					)
				: 
					<tr>
						<td colSpan={4}>
							<H4>No Items</H4>
						</td>
					</tr>
			}</tbody>
			<tfoot>
				<tr>
					<td colSpan={3}>Total</td>
					<td>{invoice.total.toLocaleString()}</td>
				</tr>
			</tfoot>
		</table>
	</FormGroup>;
}
export default observer(InvoiceItems);