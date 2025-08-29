import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Login } from "./components/Login";
import { AdminDashboard } from "./components/AdminDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />

				<Route path="/admin" element={<ProtectedRoute />}>
					<Route index element={<AdminDashboard />} />
				</Route>

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
