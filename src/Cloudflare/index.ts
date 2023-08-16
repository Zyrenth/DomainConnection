import CF from 'cloudflare';

export default class Cloudflare {
    cloudflare: CF;
    
    constructor () {
        // @ts-ignore
        this.cloudflare = new CF({
            token: process.env.CLOUDFLARE_API_KEY,
        });
    }

    private async getZoneId() {
        try {
            const zones = await this.cloudflare.zones.browse();
            const zone = zones.result.find((z) => z.name === `is-my.life`);
            
            return zone.id;
        } catch (err) {
            return null;
        }
    }

    async getTXTRecord(name) {
        const zoneId = await this.getZoneId();
        
        if(!zoneId) return null;

        try {
            const dnsRecords = await this.cloudflare.dnsRecords.browse(zoneId);
            const txtRecord = dnsRecords.result.find((r) => r.type === 'TXT' && r.name === `_discord.${name}.is-my.life`);

            if(txtRecord) return txtRecord.id;

            return null;   
        } catch (err) {
            return null;   
        }
    }

    async addTXTRecord(sub, record) {
        const zoneId = await this.getZoneId();
        
        if(!zoneId) return null;

        try {
            const response = await this.cloudflare.dnsRecords.add(zoneId, {
                type: 'TXT',
                name: `_discord.${sub}.is-my.life`,
                content: record,
                ttl: 1,
            });

            return response.success;
        } catch (err) {
            return null;
        }
    }

    async editTXTRecord(id, record) {
        const zoneId = await this.getZoneId();
        
        if(!zoneId) return null;

        try {
            const dnsRecords = await this.cloudflare.dnsRecords.browse(zoneId);
            const txtRecord = dnsRecords.result.find((r) => r.type === 'TXT' && r.id === id);
    
            txtRecord.content = record;
    
            const response = await this.cloudflare.dnsRecords.edit(zoneId, id, txtRecord);
    
            return response.success;   
        } catch (err) {
            return null;   
        }
    }
}