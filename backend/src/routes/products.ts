import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const productsRouter = Router();

productsRouter.get("/", async (_request, response, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { amountCents: "asc" }
    });

    response.json({ products });
  } catch (error) {
    next(error);
  }
});
