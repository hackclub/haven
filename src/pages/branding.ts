import type { APIRoute } from "astro";

export const GET: APIRoute = ({ redirect }) => {
  return redirect(
    "https://docs.google.com/document/d/1hc0W0iDjXEoAWda23s8ZkFefZ6vSQVGsub04a654Wr4/edit?usp=sharing",
    307,
  );
};
