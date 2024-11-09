export abstract class UserAbstract {

    abstract findOne(query: any): Promise<any>

    abstract find(query: any): Promise<any>

    abstract create(data: Record<string, any>): Promise<any>

    abstract updateOne(query: any, data: Record<string, any>): Promise<any>

    abstract getUserDetailById(id: string): Promise<any>

}