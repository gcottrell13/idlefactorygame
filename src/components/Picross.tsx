import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import "./Picross.scss";



interface Props {
    size: number;
    onSolve: () => void;
    giftRepr: React.ReactNode;
    onCancel: () => void;
}


enum ClickState {
    noGuess = 0,
    markGuess = 1,
    markEmpty = 2,
}


export function Picross({
    size,
    onSolve,
    giftRepr,
    onCancel,
}: Props) {
    const [hintsX, hintsY] = useMemo(() => generateBoard(size, size), []);
    const [mouse, setMouse] = useState<[number, number]>([-1, -1]);
    const [mouseX, mouseY] = mouse;
    const [selected, setSelected] = useState<[number, number]>([-1, -1]);
    const [selectedX, selectedY] = selected;
    const [state, setState] = useState<number[][]>(useMemo(() => generateEmptyState(size, size), []));
    const [clickState, setClickState] = useState<ClickState>(0);

    const [stateXHints, stateYHints, hasBeenSolved] = useMemo(
        () => {
            const xhint = getHints(redim(state));
            const yhint = getHints(state);
            const solved = _.isEqual(hintsX, xhint) && _.isEqual(hintsY, yhint);
            return [xhint, yhint, solved];
        },
        [state],
    );

    const [selectedRows, selectedColumns] = useMemo(
        () => {
            const selectedRows: number[] = [mouseY];
            const selectedColumns: number[] = [mouseX];

            if (selectedX !== -1) {
                const minX = Math.min(mouseX, selectedX);
                const maxX = Math.max(mouseX, selectedX);
                for (let x = minX; x <= maxX; x++) {
                    selectedColumns.push(x);
                }
            }
            if (selectedY !== -1) {
                const minY = Math.min(mouseY, selectedY);
                const maxY = Math.max(mouseY, selectedY);
                for (let y = minY; y <= maxY; y++) {
                    selectedRows.push(y);
                }
            }
            return [selectedRows, selectedColumns];
        },
        [mouseX, mouseY, selectedX, selectedY],
    );

    const onClick = useCallback(
        (x: number, y: number, which: ClickState) => {
            setClickState(which);
            setSelected([x, y]);
        },
        [],
    );

    const onMouseUp = useCallback(
        (x: number, y: number) => {
            setSelected([-1, -1]);
            setClickState(0);

            const newState = _.cloneDeep(state);
            for (let i of new Set(selectedRows)) {
                for (let j of new Set(selectedColumns)) {
                    if (newState[i][j] !== ClickState.noGuess) {
                        newState[i][j] = ClickState.noGuess;
                    }
                    else {
                        newState[i][j] = clickState;
                    }
                }
            }
            setState(newState);
        },
        [state, selectedRows, selectedColumns],
    );

    const onMouseOver = useCallback(
        (x: number, y: number) => {
            setMouse([x, y]);
        },
        [],
    );

    return (
        <Modal onHide={onCancel} show>
            <Modal.Header closeButton>
                <Modal.Title>Picross</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table className={'picross noselect'} bordered hover>
                    <tbody>
                        <tr className={'vertical-hints'}>
                            <td></td>
                            {
                                hintsX.map((h, i) => (
                                    <td className={selectedColumns.includes(i) ? 'cross-select' : ''}>
                                        <pre>{h.map((x, j) => (
                                            <span className={x === stateXHints[i][j] ? 'hint complete' : 'hint'}>
                                                {x}&#10;
                                            </span>
                                        ))}</pre>
                                    </td>
                                ))
                            }
                        </tr>
                        {
                            hintsY.map((h, i) => (
                                <BoardRow
                                    y={i}
                                    hints={h}
                                    state={state[i]}
                                    stateHints={stateYHints[i]}
                                    isRowSelected={selectedRows.includes(i)}
                                    selectedColumns={selectedColumns}
                                    onClick={onClick}
                                    onMouseUp={onMouseUp}
                                    onMouseOver={onMouseOver}
                                    isSolved={hasBeenSolved}
                                />
                            ))
                        }
                    </tbody>
                </Table>
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


interface BoardRowProps {
    y: number;
    hints: number[];
    stateHints: number[];
    state: number[];
    isRowSelected: boolean;
    selectedColumns: number[];
    onClick: (x: number, y: number, which: ClickState) => void;
    onMouseUp: (x: number, y: number) => void;
    onMouseOver: (x: number, y: number) => void;
    isSolved: boolean;
}

function BoardRow({
    y,
    hints,
    state,
    stateHints,
    isRowSelected,
    selectedColumns,
    onClick,
    onMouseUp,
    onMouseOver,
    isSolved,
}: BoardRowProps) {
    const handleClick = (e: any, x: number) => {
        if (e.type === 'mousedown') {
            onClick(x, y, ClickState.markGuess);
        } else if (e.type === 'contextmenu') {
            onClick(x, y, ClickState.markEmpty);
        }
        e.stopPropogation();
        e.preventDefault();
    };

    return (
        <tr>
            <td className={isRowSelected ? 'cross-select' : ''}>
                <pre>{hints.map((x, j) => (
                    <span className={x === stateHints[j] ? 'hint complete' : 'hint'}>
                        {x}&nbsp;
                    </span>
                ))}</pre>
            </td>
            {
                state.map((v, i) => {
                    const color =
                        isSolved ? 'solved-square' :
                            v === 1 ? 'mark-guess' :
                                v === 2 || hints.length === 0 ? 'mark-empty' :
                                    'no-mark';
                    const selected = selectedColumns.includes(i) || isRowSelected ? 'cross-select' : '';
                    return (
                        <td
                            className={`${color} ${selected} picross-square`}
                            onMouseDown={e => handleClick(e, i)}
                            onContextMenu={e => handleClick(e, i)}
                            onMouseUp={e => onMouseUp(i, y)}
                            onMouseOver={e => onMouseOver(i, y)}
                        >
                            &nbsp;
                        </td>
                    );
                })
            }
        </tr>
    );
}


function generateEmptyState(width: number, height: number): number[][] {
    const board: number[][] = Array(width);
    for (let i = 0; i < width; i++) {
        board[i] = Array(height);

        for (let j = 0; j < height; j++) {
            board[i][j] = 0;
        }
    }
    return board;
}


function generateBoard(width: number, height: number): [hintsX: number[][], hintsY: number[][]] {
    const board = generateEmptyState(width, height);
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            board[i][j] = Math.floor(Math.random() * 2);
        }
    }

    return [getHints(redim(board)), getHints(board)];
}

function redim<T>(arr: T[][]): T[][] {
    return _.zip(...arr) as T[][];
}

function getHints(board: number[][]): number[][] {
    const hints: number[][] = [];

    for (const row of board) {
        let streak = 0;
        const a: number[] = [];
        hints.push(a);

        for (const item of row) {
            if (item > 0) {
                streak += 1;
            }
            else if (streak > 0) {
                a.push(streak);
                streak = 0;
            }
        }

        if (streak > 0) {
            a.push(streak);
        }
    }

    return hints;
}