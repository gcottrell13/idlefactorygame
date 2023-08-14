import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import notes from "../ReleaseNotes.md";
import { Button, Modal } from "react-bootstrap";

interface Props {
    version: string;
}

export function ReleaseNotes({ version }: Props) {
    const [show, setShow] = useState(false);

    return (
        <>
            <Button
                className={"show-release-notes"}
                onClick={() => setShow(true)}
                variant={"secondary"}
            >
                {version}
            </Button>
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header>Release Notes</Modal.Header>
                <Modal.Body>
                    <ReactMarkdown>{notes}</ReactMarkdown>
                </Modal.Body>
            </Modal>
        </>
    );
}
