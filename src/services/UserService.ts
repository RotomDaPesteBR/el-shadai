import { PrismaClient } from '@prisma/client';

import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

export class UserService {
  static async getUserAddress(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          address: true,
          neighId: true, // Assuming neighborhood ID is needed for full address
          neighborhood: {
            // Include neighborhood details
            select: {
              description: true,
              zone: true
            }
          }
        }
      });

      if (!user) {
        return null;
      }

      // Construct a more complete address string if neighborhood data is available
      let fullAddress = user.address || '';
      if (user.neighborhood) {
        fullAddress += `, ${user.neighborhood.description} - ${user.neighborhood.zone}`;
      }

      return fullAddress.trim();
    } catch (error) {
      console.error('Error fetching user address:', error);
      throw new Error('Failed to fetch user address.');
    }
  }
}
