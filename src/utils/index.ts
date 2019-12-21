export const numberToWords = (num: number) => {
    let units = ["", "one ","two ","three ","four ", "five ","six ","seven ","eight ","nine ","ten ","eleven ","twelve ","thirteen ","fourteen ","fifteen ","sixteen ","seventeen ","eighteen ","nineteen "];
    let tens = ["", "", "twenty","thirty","forty","fifty", "sixty","seventy","eighty","ninety"];
    let weights = ["", "", "hundred", "thousand", "lakh", "crore"].reverse();
    let toTitleCase = (x: string) => x.substring(0,1).toUpperCase() + x.substring(1).toLowerCase();

    return (
        [...
            /^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/
            .exec(num.toString().padStart(9, "0"))
        ]
        .slice(1)
        .map((x, i) => {
            let part = Number(x) <= 19 ? toTitleCase(units[Number(x)]) : (
                x.padStart(2, "0")
                .split("")
                .map(Number)
                .map((y,i) => (i === 1 ? units[y] : tens[y]) || "")
                .map(toTitleCase)
                .join("")
            );
            return (part ? (part + " " + toTitleCase(weights[i])) : "").replace(/\s{2,}/g, " ");
        })
        .filter(x => x !== "")
        .join(" ")
    ) + " Only"
}

export const readableDate = (date: Date) =>
	Intl.DateTimeFormat("en-IN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric"
	})
	.format(date)
	.replace(/\//g, "-");