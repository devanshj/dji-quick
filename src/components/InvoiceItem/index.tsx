import React, { useContext, useRef, useEffect, MouseEvent, DragEvent, useState } from "react";
import { observer } from "mobx-react-lite";

import InvoiceItemModel from "../../models/InvoiceItem";
import { InvoiceContext } from "../Invoice";

import { ResizeSensor, Menu, Button, ContextMenu } from "@blueprintjs/core";




export interface IInvoiceProps {
    item: InvoiceItemModel,
    onDragStart?: () => void,
    onDragEnd?: () => void
}

const InvoiceItem = ({
    item,
    onDragStart = () => {},
    onDragEnd = () => {}
}: IInvoiceProps) => {

    let invoice = useContext(InvoiceContext)!;
    let [isDragging, setIsDragging] = useState(false);
    let [isDragOvered, setIsDragOvered] = useState(false);
    const handleDelete = () => invoice.deleteItem(item);
    const handleInsertBelow = () => invoice.insertItemAfter(item);
    const handleInsertAbove = () => invoice.insertItemBefore(item);



    let descRef = useRef<HTMLTextAreaElement>(null);
    let rowRef = useRef<HTMLTableRowElement>(null);
    const descResize = () => {
        descRef.current!.style.height = "0px";
        descRef.current!.style.height = descRef.current!.scrollHeight + "px";
        rowRef.current!.style.setProperty("--row-height", descRef.current!.offsetHeight + "px");
    }
    useEffect(descResize);


    const handleContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        ContextMenu.show(
            <Menu>
                <Menu.Item onClick={handleDelete} disabled={invoice.items.length === 1} text="Delete" icon="trash" />
                <Menu.Item onClick={handleInsertBelow} text="Insert below" icon="add-row-bottom"/>
                <Menu.Item onClick={handleInsertAbove} text="Insert above" icon="add-row-top" />
            </Menu>, {
                left: event.clientX,
                top: event.clientY
            }
        )
    }

    const handleDrop = (event: DragEvent) => {
        if (!event.dataTransfer.types.includes("text/dji-invoice-item-id")) return false;

        let swapWithIndex = invoice.items.findIndex(x => x.id === Number(
            event.dataTransfer.getData("text/dji-invoice-item-id")
        ));
        let thisIndex = invoice.items.findIndex(x => x.id === item.id);

        [
            invoice.items[thisIndex],
            invoice.items[swapWithIndex]
        ] = [
            invoice.items[thisIndex],
            invoice.items[swapWithIndex]
        ].reverse();
    }


    

    return (
        <tr onContextMenu={handleContextMenu}
        className={"invoice-item" + (isDragging ? " is-dragging" : "") + (isDragOvered ? " is-dragovered" : "")}
        ref={rowRef}
        onDrop={event => {
            handleDrop(event);
            setIsDragOvered(false);
        }}
        onDragOver={event => {
            if (!event.dataTransfer.types.includes("text/dji-invoice-item-id")) return false;
            event.preventDefault();
            setIsDragOvered(true);
        }}
        onDragLeave={event => {
            event.preventDefault();
            setIsDragOvered(false);
        }}>
            <td className="item-desc">
                <ResizeSensor onResize={descResize}>
                    <textarea 
                        value={item.desc}
                        onChange={event => {
                            item.desc = event.target.value;
                            descResize();
                        }}
                        onKeyDown={event => event.keyCode === 13 && event.preventDefault()}
                        rows={1}
                        ref={descRef}
                        className="item-input"/>
                </ResizeSensor>
            </td>
            <td className="item-qty">
                <input
                    value={item.qty}
                    onChange={event => item.qty = Number(event.target.value || event.target.min)}
                    min="1"
                    type="number"
                    className="item-input" />
            </td>
            <td className="item-rate">
                <input
                    value={item.rate}
                    onChange={event => item.rate = Number(event.target.value || event.target.min)}
                    min="0"
                    type="number"
                    className="item-input" />
            </td>
            <td className="item-cost">
                <input
                    value={item.cost}
                    readOnly
                    className="item-input" />
            </td>
            <td className="extra reorder">
                <Button draggable={true}
                onDragStart={event => {
                    let { dataTransfer } = event;
                    dataTransfer.setData("text/dji-invoice-item-id", item.id.toString());
                    let rowElem = rowRef.current!;
                    let handleRect = event.currentTarget.getBoundingClientRect();
                    dataTransfer.setDragImage(
                        rowElem, event.clientX - handleRect.left, event.clientY - handleRect.top
                    );
                    dataTransfer.effectAllowed = "Move";
                    setIsDragging(true);
                    onDragStart();
                }}
                onDragEnd={() => {
                    setIsDragging(false);
                    onDragEnd();
                }}
                icon="drag-handle-vertical" minimal={true}/>
            </td>
        </tr>
    )
}
export default observer(InvoiceItem);