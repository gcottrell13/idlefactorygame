import { Button, Col, Modal, Row, Table } from "react-bootstrap";
import GAME from '../values';
import { Sprite } from "./Sprite";
import { Items } from "../content/itemNames";
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Difficulty, GameProps } from "../typeDefs/minigame";
import _ from "lodash";
import './MemoryGame.scss';
import { SPRITES } from "../useImages";
import oinkMp3 from '../sounds/oink.mp3';

const OINK = new Audio(oinkMp3);


export function Memory({
    onCancel,
    onSolve,
    giftRepr,
    difficulty,
}: GameProps) {
    const [hasBeenSolved, setHasBeenSolved] = useState(false);

    return (
        <Modal onHide={onCancel} show size={'lg'}>
            <Modal.Header closeButton>
                <Modal.Title>Memory</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {giftRepr && (
                    <span>Play to win: {giftRepr}</span>
                )}
                <MemoryGame
                    onWin={() => setHasBeenSolved(true)}
                    difficulty={difficulty}
                />
            </Modal.Body>
            <Modal.Footer>
                {
                    hasBeenSolved && (

                        <Button
                            variant={'primary'}
                            onClick={onSolve}
                        >
                            Redeem Gift: {giftRepr}
                        </Button>
                    )
                }
            </Modal.Footer>
        </Modal>
    );
}



interface MemoryGameProps {
    onWin: () => void;
    difficulty: Difficulty;
}

function MemoryGame({
    onWin,
    difficulty,
}: MemoryGameProps) {

    const pairCount = useMemo(() => diffToPairCount(difficulty), [difficulty]);
    const missCount = useMemo(() => diffToMissCount(difficulty), [difficulty]);
    const dupes = useMemo(() => diffToDupes(difficulty), [difficulty]);
    const board = useMemo(() => generateBoard(pairCount, dupes), [dupes]);
    const cardFronts = useMemo(() => generateCardFronts(board, difficulty), [board.length, difficulty]);
    const [selected, setSelected] = useState<number[]>([]);
    const [allFlipped, setAllFlipped] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [misses, setMisses] = useState(0);

    const [oinkedTimes, setOinkedTimes] = useState(0);

    const canClickRef = useRef<boolean>(true);

    const onSelect = useCallback(
        (id: number) => {
            if (canClickRef.current && !allFlipped.includes(id)) {
                setSelected(_.uniq(_.concat(selected, [id])));

                if (misses >= missCount && oinkedTimes < 10) {
                    OINK.play();
                    setOinkedTimes(oinkedTimes + 1);
                }
            }
        },
        [selected.length, misses],
    );

    useEffect(
        () => {
            if (selected.length === dupes) {
                // check if they match
                canClickRef.current = false;

                if (_.uniq(selected.map(i => board[i])).length === 1) {
                    // they all match
                    setTimeout(
                        () => {
                            setScore(score + 1);
                            setSelected([]);
                            setAllFlipped(_.concat(selected, allFlipped));
                            canClickRef.current = true;
                        },
                        500,
                    );
                }
                else {
                    // they don't match
                    setTimeout(
                        () => {
                            setMisses(misses + 1);
                            setSelected([]);
                            canClickRef.current = true;
                        },
                        500,
                    );
                }
            }
        },
        [selected, score],
    );

    useEffect(
        () => {
            if (score === pairCount) {
                onWin();
            }
        },
        [score, onWin],
    );

    const rows = _.chunk(
        board.map((b, i) => {
            return (
                <FlipCard
                    key={i}
                    name={b}
                    flipped={selected.includes(i) || allFlipped.includes(i)}
                    id={i}
                    onClick={onSelect}
                    front={cardFronts[i]}
                />
            )
        }),
        Math.sqrt(board.length),
    );

    return (
        <div>
            <hr />
            <Row>
                <Col>
                    <h3>Match {dupes}!</h3>
                </Col>
                <Col>
                    <h4>Score: {score} / {pairCount}</h4>
                    <h4>Misses: {misses} / {missCount}</h4>
                </Col>
            </Row>
            <Table className={'memorygame noselect'} bordered>
                <tbody>
                    {rows.map((row, i) => {
                        return (
                            <tr key={i}>
                                {row.map((item, j) => <td key={j}>{item}</td>)}
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </div>
    );
}


interface FlipCardProps {
    name: Items;
    flipped: boolean;
    front: ReactNode;
    onClick: (id: number) => void;
    id: number;
}

function FlipCard({
    name,
    flipped,
    front,
    onClick,
    id,
}: FlipCardProps) {
    return (
        <div className={`flip-card ${flipped ? 'flipped' : ''}`}>
            <div className="flip-card-inner" onClick={() => onClick(id)}>
                <div className="flip-card-front">
                    {front}
                </div>
                <div className="flip-card-back">
                    <Sprite name={name} />
                </div>
            </div>
        </div>
    );
}

const VALID_GAME_ITEMS = GAME.allItemNames.filter(
    name => {
        if (name.startsWith('research-'))
            return false;
        if (name.startsWith('boost-'))
            return false;
        if (!SPRITES[name])
            return false;
        return true;
    }
);

function generateBoard(n: number, dupes = 2) {
    const randomItems = _.sampleSize(VALID_GAME_ITEMS, n);
    let total: Items[] = [];
    for (let i = 0; i < dupes; i++)
        total = _.concat(total, randomItems);

    return _.shuffle(total);
}

function generateCardFronts(board: Items[], d: Difficulty) {
    const fronts: React.ReactNode[] = [];
    for (let i = 0; i < board.length; i++) {
        switch (d) {
            case Difficulty.Easy: {
                fronts.push(<Sprite name={'star' as any} />);
                break;
            }
            case Difficulty.Medium: {
                fronts.push(<Sprite name={'star' as any} />);
                break;
            }
            case Difficulty.Hard: {
                fronts.push(<Sprite name={VALID_GAME_ITEMS[_.random(VALID_GAME_ITEMS.length - 1)]} />);
                break;
            }
        }
    }
    return fronts;
}

function diffToDupes(d: Difficulty) {
    switch (d) {
        case Difficulty.Easy: return 2;
        case Difficulty.Medium: return 2;
        case Difficulty.Hard: return 3;
    }
}

function diffToPairCount(d: Difficulty) {
    switch (d) {
        case Difficulty.Easy: return 10;
        case Difficulty.Medium: return 12;
        case Difficulty.Hard: return 12;
    }
}

function diffToMissCount(d: Difficulty) {
    switch (d) {
        case Difficulty.Easy: return 10;
        case Difficulty.Medium: return 12;
        case Difficulty.Hard: return 15;
    }
}