import { useEffect, useRef, useState } from "react";
import { Items } from "../content/itemNames";
import { Button } from "react-bootstrap";
import GAME from "../values";
import Big from "../bigmath";
import { formatNumber as d } from "../numberFormatter";
import "./ByHandButton.scss";

interface ByHandButtonProps {
    makeByHand: false | null | (() => void);
    itemName: Items;
    count: Big;
}


export function ByHandButton({ makeByHand, itemName, count }: ByHandButtonProps) {
    const isPressed = useRef<boolean>(false);
    const intervalIdRef = useRef<any>(0);
    const [MAKE_BY_HAND_INTERVAL, setIntervalId] = useState<any>(0);

    useEffect(() => {
        return () => {
            clearInterval(intervalIdRef.current);
        };
    }, []);

    useEffect(
        () => {
            if (!makeByHand && isPressed.current) {
                isPressed.current = false;
                clearInterval(intervalIdRef.current);
            }
        },
        [makeByHand],
    );

    return makeByHand === null ? undefined : (
        <Button
            className={`make-by-hand ${isPressed.current ? "shake" : ""}`}
            onMouseDown={() => {
                if (makeByHand) {
                    makeByHand();
                    const interval = setInterval(() => {
                        if (!isPressed.current) {
                            clearInterval(intervalIdRef.current);
                            return;
                        }
                        console.log(`making ${itemName}`);
                        makeByHand();
                    }, 200);
                    isPressed.current = true;
                    intervalIdRef.current = interval;
                    setIntervalId(interval);
                }
            }}
            onMouseUp={() => {
                clearInterval(intervalIdRef.current);
                isPressed.current = false;
                if (makeByHand) makeByHand();
            }}
            onMouseLeave={() => {
                isPressed.current = false;
                clearInterval(intervalIdRef.current);
            }}
            disabled={makeByHand === false}
        >
            {GAME.byHandVerbs[itemName]} {count.gt(Big.One) ? d(count) : ""}
        </Button>
    );
}
