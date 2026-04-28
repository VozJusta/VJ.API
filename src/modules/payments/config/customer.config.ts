import { Injectable } from "@nestjs/common";
import Stripe from 'stripe';


@Injectable()
export class CustomerConfigService {
    constructor() { }

    async configCustomer(email: string) {
        const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || '');

        const customer = await stripeClient.customers.create({
            email: email,
        });
        console.log(customer.id);

    }
}