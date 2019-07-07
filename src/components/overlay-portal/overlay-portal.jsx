/*
* This component is the default export of this module and is what consumers interact with
*/
import React, {useRef, useEffect, useCallback, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {useOverlayValue} from "../../helpers/use-overlay-provider";
import styles from "./overlay-portal.css";
import {get, has} from "lodash";

const generateOverlayId = (allIds) => {
    let nextId = allIds.length;

    while (has(allIds, allIds.length)) {
        nextId = allIds.length++;
    }

    return nextId;
};

const getRootElement = () => {
    return document.getElementById("overlay-0").parentElement;
};

const objectToStyleString = (obj) => {
    if (typeof obj !== "object") {
        throw "obj is not an Object";
    }

    return Object.keys(obj).reduce((acc, prop) => {
        // replace capital camel case names with dashes
        const propName = prop.replace(/([A-Z])/g, matches => `-${matches[0].toLowerCase()}`);
        return acc.concat(`${propName}: `, `${obj[prop]};`);
    }, "");
};

const OverlayPortal = React.forwardRef(({
    dataElement,
    className,
    isServer,
    focusedOverlayId,
    plane,
    position,
    transformProperty,
    shouldFixWhenBelowFocusedOverlay,
    style,
    children,
    isMainDocumentContent
}, ref) => {
    const [
        {
            onCreate,
            onUpdate,
            onDelete,
            overlayCollectionAllIds,
            overlayCollectionById,
            prevFocusedOverlayId
        },
        dispatch
    ] = useOverlayValue();

    const overlayRef = useRef(null);
    const mainDocumentContent = useRef(null);

    useEffect(
        () => {
            // Handle the initialization of the OverlayPortal
            if (
                !get(overlayRef, ["current", "id"]) &&
                get(overlayRef, ["current", "id"]) !== 0 ||
                null
            ) {
                // assign id
                overlayRef.current = {id: null, element: null};
                overlayRef.current.id = isMainDocumentContent ? 0 : generateOverlayId(overlayCollectionAllIds);
                overlayRef.current.element = isMainDocumentContent ? mainDocumentContent.current : document.createElement("div");

                if (!isMainDocumentContent) {
                    // create element
                    getRootElement().appendChild(overlayRef.current.element);

                    dispatch({
                        type: onCreate,
                        payload: {overlayId: overlayRef.current.id}
                    });
                }
            }

            if (!isMainDocumentContent) {
                // update props on overlayRef.current.element
                overlayRef.current.element.classList.add(styles.overlay, (className ? `${className}` : ""));

                // update dataElement
                overlayRef.current.element.setAttribute(
                    "data-element",
                    `overlay-${overlayRef.current.id}` + (dataElement ? ` ${dataElement}` : "")
                );
            }
        },
        [overlayCollectionAllIds, className, dataElement, dispatch, onCreate, isMainDocumentContent, mainDocumentContent]
    );

    // handle changing overlay "focus"
    // Focus refers too which overlay should be the scrollable content of the page
    useEffect(
        () => {
            // first go around the element and id won't exist so just return
            if (!get(overlayRef, ["current", "id"]) || null) {
                return;
            }

            // If the overlay is becoming focused, reset the scroll position to it's previous setting.
            if (focusedOverlayId === overlayRef.current.id && prevFocusedOverlayId !== focusedOverlayId) {
                const {scrollTop} = overlayCollectionById[overlayRef.current.id];
                (document.scrollingElement || document.documentElement).scrollTop = scrollTop || 0;
            }

            // If the overlay is losing focus, save the scroll position and the overlay's
            // current top position so it can be fixed outside of the document flow.
            if (prevFocusedOverlayId === overlayRef.current.id && prevFocusedOverlayId !== focusedOverlayId) {
                dispatch({
                    type: onUpdate,
                    payload: {
                        overlayId: overlayRef.current.id,
                        scrollTop: (document.scrollingElement || document.documentElement).scrollTop,
                        positionTop: overlayRef.current.element.getBoundingClientRect().top,
                        prevFocusedOverlayId: focusedOverlayId
                    }
                });
            }
        },
        [dispatch, focusedOverlayId, onUpdate, prevFocusedOverlayId, overlayCollectionById]
    );

    // delete
    useEffect(
        () => {
            const copyoverlayRef = overlayRef;

            return () => {
                if (!isMainDocumentContent) {
                    getRootElement().removeChild(copyoverlayRef.current.element);
                }

                dispatch({
                    type: onDelete,
                    payload: {overlayId: copyoverlayRef.current.id}
                });
            };
        },
        [dispatch, onDelete, isMainDocumentContent]
    );

    // https://reactjs.org/docs/hooks-reference.html#useimperativehandle
    useImperativeHandle(ref, () => ({
        element: get(overlayRef, ["current", "element"]) || null,
        id: get(overlayRef, ["current", "id"]) || null
    }));

    const getIsAboveFocusedOverlay = useCallback(
        () => {
            const focusedOverlay = overlayCollectionById[focusedOverlayId];
            return plane >= focusedOverlay.plane;
        },
        [focusedOverlayId, plane, overlayCollectionById]
    );

    const getOverlayStyle = useCallback(
        (isForJsxOutput) => {
            // first go around the element and id won't exist so just return
            if (
                !get(overlayRef, ["current", "element"]) || null &&
                !get(overlayRef, ["current", "id"]) &&
                get(overlayRef, ["current", "id"]) !== 0 ||
                null
            ) {
                return {};
            }

            const focused = focusedOverlayId === overlayRef.current.id;
            const zIndex = overlayRef.current.id !== 0 ? plane : undefined;
            const isAboveFocusedOverlay = getIsAboveFocusedOverlay();
            const positionTop = overlayRef.current.element.getBoundingClientRect().top;
            let overlayStyle = {};

            if (
                position === "fixed"
                || (
                    position === "absolute"
                    && (isAboveFocusedOverlay || !shouldFixWhenBelowFocusedOverlay)
                )
            ) {
                overlayStyle = {
                    left: 0,
                    top: 0,
                    [transformProperty]: "none",
                    ...style,
                    position,
                    zIndex
                };
            // If the overlay is absolutely positioned but falls behind the focused plane, we need to
            // fix it in place so it doesn't move to the top  of the relatively positioned content.
            } else if (position === "absolute" && !isAboveFocusedOverlay && shouldFixWhenBelowFocusedOverlay) {
                overlayStyle = {
                    left: 0,
                    top: 0,
                    [transformProperty]: "none",
                    ...style,
                    position,
                    zIndex
                };
            } else {
                overlayStyle = {
                    ...style,
                    overflow: "hidden",
                    position: focused ? "relative" : "fixed",
                    top: focused ? "auto" : "0",
                    left: focused ? "auto" : "0",
                    [transformProperty]: !focused && positionTop !== 0
                        ? `translate3d(0, ${positionTop}px, 0)`
                        : "translate3d(0, 0, 0)",
                    zIndex
                };
            }

            return isForJsxOutput ? overlayStyle : objectToStyleString(overlayStyle);
        },
        [
            focusedOverlayId,
            plane,
            getIsAboveFocusedOverlay,
            position,
            shouldFixWhenBelowFocusedOverlay,
            style,
            transformProperty
        ]
    );

    // The main content should be rendered on the server and isn't portaled since it is already
    // at the root
    if (isMainDocumentContent) {
        return (
            <div
                id={"overlay-0"}
                className={styles.overlay + (className ? ` ${className}` : "")}
                data-element={"overlay-0" + (dataElement ? ` ${dataElement}` : "")}
                ref={mainDocumentContent}
                style={getOverlayStyle(true)}
            >
                {children}
            </div>
        );
    }

    // All hooks need to be before this
    if (isServer || !get(overlayRef, ["current", "element"]) || null) {
        return null;
    }

    overlayRef.current.element.setAttribute(
        "style",
        getOverlayStyle()
    );

    return ReactDOM.createPortal(
        children,
        overlayRef.current.element
    );
});

OverlayPortal.displayName = "OverlayPortal";

OverlayPortal.propTypes = {
    isMainDocumentContent: PropTypes.bool,
    transformProperty: PropTypes.string,
    style: PropTypes.object,
    focusedOverlayId: PropTypes.number,
    dataElement: PropTypes.string,
    className: PropTypes.string,
    isServer: PropTypes.bool,
    children: PropTypes.any,
    plane: PropTypes.number,
    position: PropTypes.oneOf([
        "absolute",
        "fixed",
        "relative"
    ]),
    shouldFixWhenBelowFocusedOverlay: PropTypes.bool
};

OverlayPortal.defaultProps = {
    isMainDocumentContent: false,
    plane: 1,
    position: "relative",
    shouldFixWhenBelowFocusedOverlay: true
};

export default OverlayPortal;
