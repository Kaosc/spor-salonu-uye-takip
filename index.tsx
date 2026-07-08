import { registerRootComponent } from "expo"

import { I18nextProvider } from "react-i18next"
import { Provider } from "react-redux"

import ToastNotification from "./src/components/ToastNotification"
import { store } from "./src/store/store"
import i18n from "./i18n"
import App from "./App"

const IndexApp = () => {
	return (
		<I18nextProvider
			i18n={i18n}
			defaultNS={"translation"}
		>
			<Provider store={store}>
				<App />
			</Provider>
			<ToastNotification />
		</I18nextProvider>
	)
}

registerRootComponent(IndexApp)
