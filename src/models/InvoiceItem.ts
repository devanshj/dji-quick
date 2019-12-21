import { observable, computed } from "mobx";

export interface IInvoiceItemConstructorProps {
    desc: string,
    qty: number,
    rate: number
}


let LAST_ID = -1;
class InvoiceItem {
    @observable desc = "";
    @observable qty = 1;
    @observable rate = 0;
    @computed get cost() {
        return this.qty * this.rate;
    }

    id: number;
    constructor(props?: IInvoiceItemConstructorProps) {
        this.id = ++LAST_ID;
        if (!props) return;
        if (props.desc) this.desc = props.desc;
        if (props.qty && props.qty >= 1) this.qty = props.qty;
        if (props.rate && props.rate >= 0) this.rate = props.rate;
    }

    clone() {
        let { desc, qty, rate } = this;
        return new InvoiceItem({ desc, qty, rate });
    }
}
export default InvoiceItem;