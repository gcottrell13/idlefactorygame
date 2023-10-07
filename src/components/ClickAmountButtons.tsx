import { Button, ButtonToolbar } from 'react-bootstrap';
import { mapPairs } from '../smap';
import "./ClickAmountButtons.scss";


interface Props {
    multiClickOptions: {[p: string]: bigint};
    current: bigint;
    onClick: (value: bigint) => void;
}


export function ClickAmountButtons({
    current,
    multiClickOptions,
    onClick,
}: Props) {

    if (Object.keys(multiClickOptions).length > 0) {
        return (
            <ButtonToolbar className={"per-click-amount-buttons"}>
                Per Click:
                {
                    mapPairs(multiClickOptions, (value, display) => {
                        return (
                            <Button
                                key={display}
                                onClick={() => onClick(value)}
                                active={current === value}
                            >
                                {display}
                            </Button>
                        );
                    })
                }
            </ButtonToolbar>
        );
    }

    return null;
}