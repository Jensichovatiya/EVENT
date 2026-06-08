using EVENT.DAL.IRepository;
using EVENT.DAL.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.DAL {
    public static class RepositoryRegistor {
        public static Dictionary<Type, Type> GetTypes() {
            var dic = new Dictionary<Type, Type>
            {
                { typeof(ILoginRepository), typeof(LoginRepository) },
                { typeof(IUserRepository), typeof(UserRepository) },
                { typeof(IMasterRepository), typeof(MasterRepository) },
                { typeof(IEquipmentRepository), typeof(EquipmentRepository) },
                { typeof(IEventRepository),typeof(EventRepository)},
                { typeof(IFoodRepository),typeof(FoodRepository)},
                { typeof(IAgendaRepository),typeof(AgendaRepository)},
                { typeof(IArtistRepository),typeof(ArtistRepository)},
                { typeof(IGuestRepository),typeof(GuestRepository)},
                { typeof(IMusicPartyRepository),typeof(MusicPartyRepository)},
                { typeof(ISecurityRepository),typeof(SecurityRepository)},
                { typeof(IServiceStaffRepository),typeof(ServiceStaffRepository)},
                { typeof(ISponsorRepository),typeof(SponsorRepository)},
                { typeof(IEntertainmentRepository),typeof(EntertainmentRepository)},
                { typeof(IRoleManagementRepository),typeof(RoleManagementRepository)},
                { typeof(IBookingRepository),typeof(BookingRepository)},
                 { typeof(IChefRepository),typeof(ChefRepository)},
                 { typeof(ITransportRepository),typeof(TransportRepository)},
                 { typeof(IReferEarnRepository),typeof(ReferEarnRepository)}
                //{ typeof(IKnowledgeBankRepository),typeof(KnowledgeBankRepository)},
            };
            return dic;
        }
    }
}
