import { jsonSuccess, jsonError } from "@/lib/api-response";
import {
  authenticateRequest,
  withErrorHandler,
} from "@/lib/error-handler";
import { ValidationError } from "@/lib/errors";
import {
  callGroq,
  validateGroqBody,
} from "@/lib/ai/groq";

export const dynamic = "force-dynamic";

import { checkRateLimit } from "@/lib/rateLimit";

export const POST = withErrorHandler(async (request) => {
  const decodedToken = await authenticateRequest(request);

  const rateLimitResult = await checkRateLimit(decodedToken.uid);
  if (!rateLimitResult.allowed) {
    return jsonError(
      "Too many requests. Please try again later.",
      429
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Invalid request payload");
  }

  const { trimmedMessage } = validateGroqBody(body);
  const content = await callGroq(trimmedMessage);

  console.log(
    `[nova-ai-quota-tracker] Success for ${decodedToken.uid}`
  );

  return jsonSuccess({
    message: content,
  });
});
