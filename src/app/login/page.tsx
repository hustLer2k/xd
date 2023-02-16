"use client";

import { LockClosedIcon } from "@heroicons/react/20/solid";
import logoWhite from "@public/logo_white.png";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSupabase } from "@/components/store/supa-provider";
import { useRouter } from "next/navigation";

import Input, { InputRef } from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// validators
const emailValidator = (value: string) => {
	if (!value) return [false, "Email must not be empty"] as const;

	return [
		/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value),
		"Email is not valid",
	] as const;
};

const PWValidator = (value: string) => {
	if (value.length < 8)
		return [false, "Password must contain at least 8 characters"] as const;

	return [
		!/^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*)$/.test(value),
		"Password must contain a number, an uppercase and lowercase character",
	] as const;
};

export default function Auth() {
	const { supabase } = useSupabase();
	const router = useRouter();

	const [isRegistering, setIsRegistering] = useState(true);
	const [error, setError] = useState("");
	const [isLoading, setLoading] = useState(false);

	const emailRef = useRef<InputRef>(null);
	const PWRef = useRef<InputRef>(null);

	const formSubmitHandler = async (event: React.SyntheticEvent) => {
		event.preventDefault();

		if (!(emailRef.current!.isValid && emailRef.current!.isValid)) return;

		const supa_function = isRegistering
			? supabase.auth.signUp
			: supabase.auth.signInWithPassword;

		setLoading(true);
		const { data, error } = await supa_function.bind(supabase.auth)({
			email: emailRef.current!.value,
			password: PWRef.current!.value,
			options: {
				emailRedirectTo: "/account/setup",
			},
		});

		if (error) {
			setError(error.message);
			setLoading(false);
		} else {
			console.log(data);

			if (isRegistering) router.replace("/account/setup");
			else router.replace("/");
		}
	};

	return (
		<>
			<div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-8">
					<div>
						<Image
							src={logoWhite}
							alt="Pimp logo"
							width={300}
							height={300}
							className="mx-auto w-auto"
						/>
						<h2 className="text-gray-900 mt-6 text-center text-3xl font-bold tracking-tight">
							{isRegistering
								? "Create an account"
								: "Sign in to your account"}
						</h2>
						<p className="text-gray-600 mt-2 text-center text-sm">
							Or{" "}
							<button
								onClick={() =>
									setIsRegistering((prevState) => !prevState)
								}
								className="font-medium text-purple-600 hover:text-purple-500"
							>
								{isRegistering
									? "log in to your account"
									: "sign up for free with an email"}
							</button>
						</p>
					</div>
					<form
						className="mt-8 space-y-6"
						onSubmit={formSubmitHandler}
					>
						<input
							type="hidden"
							name="remember"
							defaultValue="true"
						/>
						<div className="-space-y-px rounded-md shadow-sm">
							<Input
								ref={emailRef}
								label="Email address"
								predicate={emailValidator}
								inputOptions={{
									id: "email-address",
									name: "email",
									type: "email",
									autoComplete: "email",
									required: true,
									placeholder: "Email address",
									className: "rounded-t-md",
								}}
							/>
							<Input
								ref={PWRef}
								label="Password"
								predicate={PWValidator}
								inputOptions={{
									id: "password",
									name: "password",
									type: "password",
									autoComplete: "password",
									required: true,
									placeholder: "Password",
									className: "rounded-b-md",
								}}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									className="border-gray-300 h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
								/>
								<label
									htmlFor="remember-me"
									className="text-grey-500 ml-2 block text-sm"
								>
									Remember me
								</label>
							</div>

							{!isRegistering && (
								<div className="text-sm">
									<a
										href="#"
										className="font-medium text-purple-600 hover:text-purple-500"
									>
										Forgot your password?
									</a>
								</div>
							)}
						</div>

						{error && (
							<p className="text-rose-500 text-center font-medium">
								{error}
							</p>
						)}

						<div>
							<button
								onClick={() => {
									emailRef.current!.touch();
									PWRef.current!.touch();
								}}
								type="submit"
								className="max-h-10 bg-purple-600 border-transparent text-white group relative flex items-center w-full justify-center rounded-md border py-2 px-4 text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
							>
								<span className="absolute inset-y-0 left-0 flex items-center pl-3">
									<LockClosedIcon
										className="h-5 w-5 text-purple-300 group-hover:text-purple-400"
										aria-hidden="true"
									/>
								</span>
								{isLoading ? (
									<LoadingSpinner
										size={69}
										stroke={"#f5d0fe"}
									/>
								) : (
									`Sign ${isRegistering ? "up" : "in"}`
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
