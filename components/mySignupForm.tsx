"use client";
import {signUpSchema} from "@/schemas/signUpSchema";
import {useSignUp} from "@clerk/nextjs";
import {Button} from "@heroui/button";
import {Card, CardBody, CardHeader, CardFooter} from "@heroui/card";
import {Divider} from "@heroui/divider";
import {Input} from "@heroui/input";
import {zodResolver} from "@hookform/resolvers/zod";
import {AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";

const mySignupForm = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationErrors, setVerificationErrors] = useState<string | null>(
    null
  );
  const [authError, setAuthError] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const route = useRouter();

  const {signUp, isLoaded, setActive} = useSignUp();

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return;
    // now its loaded otherwise we would have exited before if clerk is not laoded
    setIsSubmitting(true);
    setAuthError(null);

    // this is for signup in clerk attempting to signup in clerk
    try {
      // passing on the data to the signup function of clerk
      signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      // preparing the email verification

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // attempting to complete the validations
      setIsVerifying(true);
    } catch (error: any) {
      setAuthError(error.errors?.[0]?.message || "Error occured during signup");
      console.error("Error sign up for the user", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // here we are doing the thing that we are trying to send the verification code to the user email address and checking the status if its correct or not

  // if the status seems to be true then we will setActive the session that we got with the session data id.
  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!isLoaded || !signUp) return;
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status == "complete") {
        await setActive({session: result.createdSessionId});
        route.push("/dashboard");
      } else {
        console.error("Verification Incommplete ", result);
        setVerificationErrors("Verification could not complete");
      }
    } catch (error: any) {
      setVerificationErrors(
        error.errors?.[0]?.message || "Error occured during verification"
      );
      console.error("Error validation for the user", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  return isVerifying ? (
    <div>
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-default-900">
            Verify Your Email
          </h1>
          <p className="text-default-500 text-center">
            We've sent a verification code to your email
          </p>
        </CardHeader>

        <Divider />
        <CardBody className="py-6">
          {verificationErrors && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{verificationErrors}</p>
            </div>
          )}

          <form
            onSubmit={handleVerificationSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="text-sm font-medium text-default-900"
              >
                Verification Code
              </label>

              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter the 6-digit code"
                className="w-full"
                autoFocus
              ></Input>
            </div>
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-default-500">
              Didn't receive a code?{" "}
              <button
                onClick={async () => {
                  if (signUp) {
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    });
                  }
                }}
                className="text-primary hover:underline font-medium"
              >
                Resend code
              </button>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  ) : (
    <div>
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-default-900">
            Create Your Account
          </h1>
          <p className="text-default-500 text-center">
            Sign up to start managing your images securely
          </p>
        </CardHeader>

        <Divider />

        <CardBody className="py-6">
          {authError && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{authError}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-default-900"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                startContent={<Mail className="h-4 w-4 text-default-500" />}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                {...register("email")}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-default-900"
              >
                Password
              </label>

              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                startContent={<Lock className="h-4 w-4 text-default-500" />}
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-default-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-default-500" />
                    )}
                  </Button>
                }
                isInvalid={!!errors.passwordConfirmation}
                errorMessage={errors.passwordConfirmation?.message}
                {...register("passwordConfirmation")}
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-default-600">
                  By signing up, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardBody>

        <Divider />
        <CardFooter className="flex justify-center py-4">
          <p className="text-sm text-default-600">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default mySignupForm;
