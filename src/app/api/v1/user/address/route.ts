import { auth } from '@/app/auth';
import { UserService } from '@/services/UserService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userAddress = await UserService.getUserAddress(userId);

    if (!userAddress) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ address: userAddress }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/v1/user/address:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
