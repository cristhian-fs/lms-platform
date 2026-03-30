import { queryOptions } from "@tanstack/react-query";
import { authClient } from "./auth-client";

export const getSession = async () => {
	const res = await authClient.getSession();
	if (res.data?.session) {
		return res.data.session;
	}

	return null;
};

export const getUser = async () => {
	const res = await authClient.getSession();
	if (res.data?.user) {
		return res.data.user;
	}

	return null;
};

export const userQueryOptions = () =>
	queryOptions({
		queryKey: ["user"],
		queryFn: getUser,
		staleTime: Number.POSITIVE_INFINITY,
	});
