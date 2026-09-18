import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = () => {
  redirect(
    307,
    "https://docs.google.com/document/d/1hc0W0iDjXEoAWda23s8ZkFefZ6vSQVGsub04a654Wr4/edit?usp=sharing",
  );
};
