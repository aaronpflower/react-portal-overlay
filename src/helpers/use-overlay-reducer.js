// Factory function to create and update a overlay item
export const overlayCollectionItem = (args) => {
    const {
        overlayId = null,
        scrollTop = 0,
        positionTop = 0
    } = args;

    return {
        [overlayId]: {
            overlayId,
            scrollTop,
            positionTop
        }
    };
};

export const actionTypes = {
    onCreate: "ON_CREATE",
    onUpdate: "ON_UPDATE",
    onDelete: "ON_DELETE",
    onUpdateFocusedOverlay: "ON_UPDATE_FOCUSED_OVERLAY"
};

export const overlaysDefaultState = {
    ...actionTypes,
    overlayCollectionById: {},
    overlayCollectionAllIds: [],
    prevFocusedOverlayId: null
};

/*
* Init is called when <Root /> is first rendered
* It then by default creates a <Overlay /> with the OverlayId of 0
* OverlayId 0 will always be the "main scrollable document"
*/
export function overlaysInit(args) {
    return {
        ...overlaysDefaultState,
        overlayCollectionById: overlayCollectionItem(args),
        overlayCollectionAllIds: [args.overlayId],
        prevFocusedOverlayId: 0
    };
}

export function overlaysReducer(state, action) {
    const {type, payload} = action;
    switch (type) {
        // With creating we just need to spread the new item into state
        case actionTypes.onCreate:
            return {
                ...state,
                overlayCollectionById: {
                    ...state.overlayCollectionById,
                    ...overlayCollectionItem(payload)
                },
                overlayCollectionAllIds: [
                    ...state.overlayCollectionAllIds,
                    payload.OverlayId
                ]
            };
        // When props change we need to update those within overlayCollectionById
        case actionTypes.onUpdate:
            return {
                ...state,
                prevFocusedOverlayId: payload.prevFocusedOverlayId,
                overlayCollectionById: {
                    ...state.overlayCollectionById,
                    [payload.OverlayId]: {
                        ...state.overlayCollectionById[payload.OverlayId],
                        ...payload
                    }
                }
            };
        // find the item and DELETE IT from the collection
        case actionTypes.onDelete:
            const nextIds = state.overlayCollectionAllIds.filter(i => i.OverlayId !== payload.OverlayId);
            return {
                ...state,
                overlayCollectionById: nextIds.reduce((acc, curr) => {
                    return {
                        ...acc,
                        [curr]: {
                            ...state.overlayCollectionById[curr]
                        }
                    };
                }, {}),
                overlayCollectionAllIds: nextIds
            };
        case actionTypes.onUpdateFocusedOverlay:
            return {
                ...state,
                prevFocusedOverlayId: payload.focusedOverlayId
            };
        default:
            throw new Error();
    }
}
