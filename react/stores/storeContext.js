import React from 'react';
import rootStore from './RootStore';

const storeContext = React.createContext(rootStore);

export const StoreProvider = storeContext.Provider;// export const StoreConsumer = storeContext.Consumer;

export default storeContext;