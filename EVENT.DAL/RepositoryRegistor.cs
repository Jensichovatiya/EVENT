using EVENT.DAL.IRepository;
using EVENT.DAL.Repository;
using System;
using System.Collections.Generic;

namespace EVENT.DAL {
    public static class RepositoryRegistor {
        public static Dictionary<Type, Type> GetTypes() {
            var dic = new Dictionary<Type, Type>
            {
                { typeof(ILoginRepository), typeof(LoginRepository) },
                { typeof(IAuthRepository), typeof(AuthRepository) },
                { typeof(IEventRepository), typeof(EventRepository) },
                { typeof(ICategoryRepository), typeof(CategoryRepository) },
                { typeof(IAssetRepository), typeof(AssetRepository) },
                { typeof(IBookingRepository), typeof(BookingRepository) },
                { typeof(IPaymentRepository), typeof(PaymentRepository) },
                { typeof(IPassRepository), typeof(PassRepository) },
                { typeof(IDropdownRepository), typeof(DropdownRepository) },
                { typeof(IReportRepository), typeof(ReportRepository) },
                { typeof(ISettingsRepository), typeof(SettingsRepository) },
                { typeof(IBlueprintRepository), typeof(BlueprintRepository) },
                { typeof(INotificationRepository), typeof(NotificationRepository) },
                { typeof(IFacilityRepository), typeof(FacilityRepository) },
                { typeof(IOrganizerContactRepository), typeof(OrganizerContactRepository) },
                { typeof(ITicketRepository), typeof(TicketRepository) },
                { typeof(IComponentRepository), typeof(ComponentRepository) },
            };
            return dic;
        }
    }
}
