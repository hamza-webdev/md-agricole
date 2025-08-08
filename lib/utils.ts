import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Product } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convertit un produit Prisma vers le type Product de l'application
 * Gère la conversion des types Decimal vers number et null vers undefined
 */
export function convertPrismaProductToProduct(prismaProduct: any): Product {
  return {
    ...prismaProduct,
    price: Number(prismaProduct.price),
    description: prismaProduct.description || undefined,
    createdAt: prismaProduct.createdAt,
    updatedAt: prismaProduct.updatedAt
  };
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}