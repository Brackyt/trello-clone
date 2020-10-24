import React, { useState, useEffect, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import BoardBackground from "./BoardBackground";
import { getEditControlsSidePosition } from "../boards/Card";
import {
    modalBlurHandler,
    getBoardBackgroundOptions,
    authAxios,
} from "../../static/js/util";
import useAxiosGet from "../../hooks/useAxiosGet";
import { backendUrl } from "../../static/js/const";

const AddBoardModal = ({ setShowAddBoardModal, addBoard, project }) => {
    const [selectedBackground, setSelectedBackground] = useState(0);
    const [title, setTitle] = useState("");
    const [showBoardModal, setShowBoardModal] = useState(false);
    const boardElem = useRef(null);
    useEffect(modalBlurHandler(setShowAddBoardModal), []);

    const onSubmit = async (e) => {
        e.preventDefault();

        const bg = options[selectedBackground];
        const formData = { title };
        if (project !== 0) formData.project = project;
        if (bg[1]) {
            // Image_url
            formData.image_url = bg[2];
        } else {
            // color
            formData.color = bg[0].substring(1); // We don't store # char in backend
        }
        const { data } = await authAxios.post(
            `${backendUrl}/boards/`,
            formData
        );
        addBoard(data);
        setShowAddBoardModal(false);
    };

    const accessKey = process.env.REACT_APP_UNSPLASH_API_ACCESS_KEY;
    const { data } = useAxiosGet(
        `https://api.unsplash.com/photos?client_id=${accessKey}`,
        false
    );
    const options = useMemo(() => getBoardBackgroundOptions(data), [data]); // So we don't reshuffle on state change
    if (!data) return null;
    return (
        <>
            {showBoardModal ? (
                <BoardBackground
                    setShowBoardModal={setShowBoardModal}
                    setBackground={setSelectedBackground}
                    position={getEditControlsSidePosition(boardElem.current)}
                />
            ) : null}
            <div className="addboard-modal">
                <form className="addboard-modal__left" onSubmit={onSubmit}>
                    <div
                        className="addboard-modal__title-block"
                        style={bgImage(...options[selectedBackground])}
                    >
                        <input
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                            }}
                            className="addboard-modal__title"
                            placeholder="Add board title"
                        />
                        <button
                            className="addboard-modal__exit"
                            onClick={() => setShowAddBoardModal(false)}
                        >
                            <i className="fal fa-times"></i>
                        </button>
                    </div>
                    {title.trim() === "" ? (
                        <button
                            className="addboard-modal__create btn btn--disabled"
                            disabled
                        >
                            Create Board
                        </button>
                    ) : (
                        <button
                            className="addboard-modal__create btn"
                            type="submit"
                        >
                            Create Board
                        </button>
                    )}
                </form>

                <div className="addboard-modal__right" ref={boardElem}>
                    {options.map((option, index) => (
                        <button
                            onClick={() => {
                                setSelectedBackground(index);
                            }}
                            className={`addboard-modal__color-box${
                                option[1] ? " color-box--img" : ""
                            }`}
                            style={bgImage(...option)}
                            key={uuidv4()}
                        >
                            {" "}
                            {selectedBackground == index && (
                                <i className="fal fa-check"></i>
                            )}{" "}
                        </button>
                    ))}
                    <button
                        className="addboard-modal__color-box"
                        onClick={() => setShowBoardModal(true)}
                    >
                        <i className="fal fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>
        </>
    );
};

const bgImage = (bg, img = true) => {
    if (img)
        return {
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
        };
    return { backgroundColor: bg };
};

export default AddBoardModal;
