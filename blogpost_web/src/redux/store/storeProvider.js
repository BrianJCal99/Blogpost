import { useRef, useEffect } from 'react';
import store from "../store/store"
import { Provider } from "react-redux";
import { fetchUser } from "../features/user/userSlice";

export default function StoreProvider({ children }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      store.dispatch(fetchUser());
      initialized.current = true;
    }
  }, []);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
