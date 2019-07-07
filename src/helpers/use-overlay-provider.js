import React, {createContext, useContext, useReducer} from "react";
import PropTypes from "prop-types";
export const OverlayContext = createContext();

export const OverlayProvider = ({reducer, initProps, init, children}) =>(
    <OverlayContext.Provider value={useReducer(reducer, initProps, init)}>
        {children}
    </OverlayContext.Provider>
);

OverlayProvider.propTypes = {
    reducer: PropTypes.func,
    initProps: PropTypes.object,
    init: PropTypes.func,
    children: PropTypes.any
};

export const useOverlayValue = () => useContext(OverlayContext);
