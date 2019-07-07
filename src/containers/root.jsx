/*
* This is the main export from ./src/containers which wraps root.jsx in <Overlay.Provider />
* This in a way is a experimental pattern to try out, a couple reasons for it
* 1) Providing a clean separation between props coming from Redux State and Local Component state managed by useReducer
* 2) To provide a convenient way for child components to consume state from useReducer by leveraging useContext
*/
import React from "react";
import PropTypes from "prop-types";
import {overlayInit, overlayReducer} from "../helpers/use-overlay-reducer";
import {RootProvider} from "../helpers/use-overlay-provider";
import OverlayPortal from "../components/overlay-portal/overlay-portal";

const Root = React.memo((props) => {

    return (
        <RootProvider
            // technically this isn't initState instead this is following the "lazy init" pattern
            // https://reactjs.org/docs/hooks-reference.html#lazy-initialization
            // Since some prop values are needed for initial state
            // Init root
            initProps={{overlayId: 0}}
            reducer={overlayReducer}
            init={overlayInit}
        >
            <OverlayPortal isMainDocumentContent={true}>
                {props.children}
            </OverlayPortal>
        </RootProvider>
    );
});

Root.displayName = "Root";

Root.propTypes = {
    children: PropTypes.any
};

export default Root;
