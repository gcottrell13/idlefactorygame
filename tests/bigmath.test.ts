import Big from "../src/bigmath";


describe("bigmath", () => {
    it("can add", () => {
        
        const two = Big.One.add(Big.One);

        expect(two.toNumber()).toBe(2);

    });


});